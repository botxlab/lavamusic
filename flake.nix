{
  description = "Dev environment";
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable&shallow=1";
    systems.url = "github:nix-systems/default";
    flake-utils = {
      url = "github:numtide/flake-utils";
      inputs.systems.follows = "systems";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };

        # Development dependencies
        devPackages = with pkgs; [
          git
          bun
          docker-compose
          biome
        ];

        # Environment variables
        env = {
          NODE_OPTIONS = "--openssl-legacy-provider";
        };
      in
      {
        devShells.default = pkgs.mkShell {
          nativeBuildInputs = devPackages;

          NODE_OPTIONS = "--openssl-legacy-provider";

          shellHook = ''
            echo "🎵 Lavamusic Development Environment"
            echo ""
            echo "🔧 Tools:"
            echo "  • Bun $(bun --version)"
            echo "  • Git $(git version | awk '{print $3}')"
            echo "  • Biome $(biome --version | awk '{print $2}')"
            echo ""
            echo "💻 Development commands:"
            echo "  • bun install"
            echo "  • bun run dev"
            echo "  • bun run lint"
            echo "  • bun run format"
            echo ""
            echo "🐳 Docker:"
            echo "  • docker-compose up -d"
            echo ""
          '';
        };

        # Formatter for nix files
        formatter = pkgs.nixfmt-rfc-style;
      }
    );
}
