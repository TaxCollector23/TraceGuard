# TraceGuard Homebrew formula.
#
# Installs the `trg` binary from GitHub Releases and symlinks `traceguard` to it.
# SHA256 values are for the v0.1.0 release assets.
#
# NOTE: the macOS Intel (x86_64) asset may lag the others when GitHub's macOS-13
# runners are queued; its sha256 is filled once that asset publishes. Apple
# Silicon and Linux work immediately. Intel-mac users can use the curl installer
# in the meantime: curl -fsSL https://raw.githubusercontent.com/TaxCollector23/TraceGuard/main/scripts/install.sh | sh
class Traceguard < Formula
  desc "Local black box recorder, safety layer, and patch review for AI coding agents"
  homepage "https://github.com/TaxCollector23/TraceGuard"
  version "0.1.0"
  license "MIT"

  on_macos do
    on_arm do
      url "https://github.com/TaxCollector23/TraceGuard/releases/download/v0.1.0/trg-macos-arm64"
      sha256 "359573d66040f0484f2f6f3c66b6f06415eefa4ecf24f90d7e204996f1f6ee3e"
    end
    on_intel do
      url "https://github.com/TaxCollector23/TraceGuard/releases/download/v0.1.0/trg-macos-x64"
      sha256 "0000000000000000000000000000000000000000000000000000000000000000"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/TaxCollector23/TraceGuard/releases/download/v0.1.0/trg-linux-arm64"
      sha256 "964c0956bda201ad649f51f4113fa3640a80d730576f06b4bcab1e500a14cc5f"
    end
    on_intel do
      url "https://github.com/TaxCollector23/TraceGuard/releases/download/v0.1.0/trg-linux-x64"
      sha256 "68639123bed19dbd0de44fcf4bdcadea37c33201ba22534508926f1549fe5910"
    end
  end

  def install
    # The downloaded artifact is the bare binary; name it `trg` on install.
    binary = Dir["*"].first
    bin.install binary => "trg"
    # Provide the long alias `traceguard` pointing at the same binary.
    bin.install_symlink "trg" => "traceguard"
  end

  test do
    assert_match "trg", shell_output("#{bin}/trg --version")
  end
end
