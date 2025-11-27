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

## Project Structure

- `app/`: Frontend React application.
  - `components/`: Reusable UI components.
  - `dashboard/`: Main dashboard view.
  - `gallery/`: Image gallery view.
  - `stores/`: Zustand state management.
- `server/`: Backend server (Bun).
  - `api/`: API route handlers.
  - `index.ts`: Server entry point.
- `models/`: Directory to store Stable Diffusion models.
- `output/`: Directory where generated images are saved.

## Tech

- **Runtime**: [Bun](https://bun.sh/)
- **Frontend**: [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Backend**: Bun native HTTP server
- **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/), [exifr](https://github.com/MikeKovarik/exifr)
