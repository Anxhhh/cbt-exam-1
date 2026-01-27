# StatePrep - Advanced Computer Based Test (CBT) Platform

StatePrep is a modern, high-stakes Computer Based Test (CBT) application designed for Himachal Pradesh State level exams (HPAS, HPPSC, HPRCA). It features a high-fidelity examination environment, real-time analytics, and a premium "glassmorphism" UI powered by React and Three.js.

## Key Features

-   **Real-time Exam Engine**: Strict timed environment with auto-submission and state persistence.
-   **Immersive Experience**: Interactive Three.js backgrounds and smooth framer-motion animations.
-   **Smart Analytics**: Instant feedback, Z-score evaluation, and detailed question matrix.
-   **Cross-Platform**: Fully responsive design optimized for both desktop testing centers and mobile revision.
-   **CBT Simulation**: Replicates the actual interface of state-level computer-based tests.

## Stability & Cross-Platform Support

StatePrep is built with an "Anti-Gravity" stability philosophy—ensuring the application remains grounded, responsive, and performant regardless of device constraints or network conditions.

### Device Support Matrix

| Device Type | Browsers | Operating System | Support Level |
| :--- | :--- | :--- | :--- |
| **Desktop / Laptop** | Chrome, Edge, Firefox, Safari | Windows, macOS, Linux | ✅ **Tier 1 (Primary)** |
| **Tablet** | Safari, Chrome | iPadOS, Android | ✅ **Tier 1 (Touch Optimized)** |
| **Mobile** | Safari, Chrome, Samsung Internet | iOS (15+), Android (10+) | ✅ **Tier 1 (Responsive)** |

### Testing Strategy

We employ a rigorous testing suite to ensure exam integrity across all platforms:

*   **"Anti-Gravity" Stress Tests**: Automated scenarios using **Playwright** verify that layout elements (Z-index layers, modals) never obscure exam questions on small viewports.
*   **State Persistence**: Functional tests ensure `localStorage` correctly saves progress during accidental tab closures or mobile backgrounding (e.g., receiving a phone call).
*   **Chaos Engineering**: We simulate network failures at critical submission points to verify offline caching mechanisms.

### Performance Focus

To maintain a 60fps experience even on mid-range devices, we utilize strict performance budgets:
*   **Three.js Optimization**: The 3D background runs on a separate render loop with automatic quality degradation on lower-power devices to keep the main thread free for the exam engine.
*   **React Memoization**: Extensive use of `useMemo` and `useCallback` ensures that timer ticks do not cause unnecessary re-renders of the question palette.

### Running Tests locally

To execute the automated test suite and verify system stability:

```bash
# Run all unit and integration tests
npm test

# Run end-to-end visual regression tests (if configured)
npm run test:e2e
```

## Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Anxhhh/cbt-exam-1.git
    cd cbt-exam-1
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

## License

This project is open-source and available under the [MIT License](LICENSE).
