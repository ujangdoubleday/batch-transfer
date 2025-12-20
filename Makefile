.PHONY: all install test build clean run

# Default target: runs clean, install, test, and build
all: clean install test build

# Installs dependencies
install:
	forge install
	npm install

# Runs tests
test:
	forge test

# Builds the project and copies ABI
build:
	forge build
	@mkdir -p ui/src/abi
	@cp -f out/BatchTransferContract.sol/BatchTransferContract.json ui/src/abi/

# Cleans build artifacts
clean:
	forge clean

# Runs the UI (build + preview)
run:
	npm run build
	npm run preview
