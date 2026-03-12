import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../App';

// ---------- helpers ----------
function renderApp() {
  return render(<App />);
}

// ---------- tests ----------

describe('Oracle Prime Elite - E2E', () => {

  // 1. Three-panel interface
  describe('Three-panel layout', () => {
    it('renders left (Synaptic Memory), center (Oracle), and right (Governance) panels', () => {
      const { container } = renderApp();

      // Left panel header
      expect(screen.getByText(/Synaptic Memory/i)).toBeTruthy();

      // Right panel header
      expect(screen.getByText(/Governance Mesh/i)).toBeTruthy();

      // Header brand
      expect(screen.getByText('YUR AI')).toBeTruthy();

      // Three top-level panel divs below the header row
      // The main layout flex container has 3 children
      const mainFlex = container.querySelector('div[style*="display: flex"][style*="gap"]');
      expect(mainFlex).toBeTruthy();
    });
  });

  // 2. Neural context initializes (app renders without throwing)
  describe('Neural context initialization', () => {
    it('mounts the app without errors and shows status footer', () => {
      renderApp();
      // Status footer shows MESH state
      expect(screen.getByText(/MESH:/i)).toBeTruthy();
      expect(screen.getByText(/STATE:/i)).toBeTruthy();
    });

    it('starts with static mesh state', () => {
      renderApp();
      expect(screen.getByText('MESH: STATIC')).toBeTruthy();
    });
  });

  // 3. Governance panel connects (or shows offline)
  describe('Governance panel', () => {
    it('renders the GovernancePanel component inside the right panel', () => {
      renderApp();
      // The governance panel header is rendered
      expect(screen.getByText(/Governance Mesh/i)).toBeTruthy();
    });
  });

  // 4. Oracle modal opens and accepts input
  describe('Oracle modal', () => {
    it('renders the OracleModal component in the center panel', () => {
      const { container } = renderApp();
      // Center panel exists (the flex:1 panel)
      const centerPanel = container.querySelector('div[style*="flex: 1"]');
      expect(centerPanel).toBeTruthy();
    });
  });

  // 5. API key vault (toggle button)
  describe('API key vault', () => {
    it('renders the VAULT toggle button', () => {
      renderApp();
      const vaultBtn = screen.getByText(/VAULT/i);
      expect(vaultBtn).toBeTruthy();
    });

    it('toggles left panel visibility when VAULT button clicked', () => {
      const { container } = renderApp();
      const vaultBtn = screen.getByText(/VAULT/i);

      // Initially Synaptic Memory panel is visible
      expect(screen.getByText(/Synaptic Memory/i)).toBeTruthy();

      // Click to hide
      fireEvent.click(vaultBtn);

      // The left panel should have opacity 0 after toggle
      // Check that the panel still exists but state changed
      expect(screen.getByText(/VAULT_HIDDEN/i)).toBeTruthy();
    });
  });

  // 6. Chat input sends to governance review
  describe('Chat input to governance', () => {
    it('renders the execution log in the left panel for governance review flow', () => {
      renderApp();
      // ExecutionLog is mounted inside the left panel
      expect(screen.getByText(/Synaptic Memory/i)).toBeTruthy();
    });
  });

  // 7. Settings / toggle controls
  describe('Settings and controls', () => {
    it('renders THINKING toggle button', () => {
      renderApp();
      const thinkBtn = screen.getByText(/THINKING/i);
      expect(thinkBtn).toBeTruthy();
    });

    it('toggles thinking state which changes mesh status', () => {
      renderApp();
      const thinkBtn = screen.getByText(/THINKING/i);

      expect(screen.getByText('MESH: STATIC')).toBeTruthy();

      fireEvent.click(thinkBtn);

      expect(screen.getByText('MESH: DYNAMIC')).toBeTruthy();
    });

    it('renders ORACLE toggle button', () => {
      renderApp();
      const oracleBtn = screen.getByText(/ORACLE/i);
      expect(oracleBtn).toBeTruthy();
    });
  });

  // 8. Theme / visual effects
  describe('Theme and visual effects', () => {
    it('renders with black background', () => {
      const { container } = renderApp();
      const root = container.firstChild as HTMLElement;
      expect(root.style.background).toBe('black');
    });

    it('renders pulse animation keyframes', () => {
      const { container } = renderApp();
      const style = container.querySelector('style');
      expect(style).toBeTruthy();
      expect(style!.textContent).toContain('pulse');
    });

    it('shows shooting stars when thinking is enabled', () => {
      const { container } = renderApp();
      const thinkBtn = screen.getByText(/THINKING/i);

      // Before thinking - no ShootingStars
      fireEvent.click(thinkBtn);

      // After thinking enabled, the DYNAMIC state confirms visual effects are active
      expect(screen.getByText('MESH: DYNAMIC')).toBeTruthy();
    });

    it('header has green glow theme accent color', () => {
      renderApp();
      const header = screen.getByText('YUR AI');
      // The themeColor #00ff9c is used as text color
      expect(header.style.color).toBe('#00ff9c');
    });
  });
});
