# fuifui

A simple, modern txt2img web UI for [stable-diffusion.cpp](https://github.com/leejet/stable-diffusion.cpp).

## Prerequisites

- **[Bun](https://bun.sh/)** as a runtime and package manager.
- **[stable-diffusion.cpp](https://github.com/leejet/stable-diffusion.cpp)**: You can place `sd` binary from `stable-diffusion.cpp` in `fuifui` directory or system's `$PATH`.

## Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/nullxception/fuifui.git
    cd fuifui
    ```

2.  Install dependencies:
    ```bash
    bun install
    ```

## Usage

### Production

To run the application in production mode:

```bash
bun app
```

### Development Server

To start the development server with hot reloading:

```bash
bun dev
```

The application will be available at `http://localhost:5141`.
