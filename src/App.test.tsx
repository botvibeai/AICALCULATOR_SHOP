import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Mock fetch for Chatbot
global.fetch = vi.fn();

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Default mock response for chat
    (global.fetch as any).mockResolvedValue({
      json: async () => ({ response: 'Hello from Astro!' }),
    });
  });

  it('renders home view by default', () => {
    render(<App />);
    const logos = screen.getAllByText(/AICalculator/);
    expect(logos.length).toBeGreaterThan(0);
    expect(screen.getByText(/Featured Categories/i)).toBeInTheDocument();
  });

  it('navigates to All Tools view via navigation', async () => {
    render(<App />);
    // Select the "All Tools" button in the navigation
    const nav = screen.getByRole('navigation');
    const allToolsBtn = nav.querySelector('button:nth-child(2)'); // Home, All Tools, Favorites
    if (!allToolsBtn) throw new Error('All Tools button not found in nav');
    
    fireEvent.click(allToolsBtn);
    
    // Check for "EXPLORE OUR" which is in the tools view header
    await waitFor(() => {
      expect(screen.getByText(/EXPLORE OUR/i)).toBeInTheDocument();
    });
  });

  it('filters tools by search query in All Tools view', async () => {
    render(<App />);
    // Navigate to All Tools
    const allToolsBtn = screen.getAllByText('All Tools').find(b => b.tagName === 'BUTTON');
    if (!allToolsBtn) throw new Error('All Tools button not found');
    fireEvent.click(allToolsBtn);

    const searchInput = await screen.findByPlaceholderText(/Search tools & logic/i);
    fireEvent.change(searchInput, { target: { value: 'BMI' } });
    
    expect(screen.getByText('BMI Calculator')).toBeInTheDocument();
    // Mortgage should be filtered out
    expect(screen.queryByText('Mortgage Payment')).not.toBeInTheDocument();
  });

  it('adds a tool to favorites', async () => {
    render(<App />);
    const allToolsBtn = screen.getAllByText('All Tools').find(b => b.tagName === 'BUTTON');
    if (!allToolsBtn) throw new Error('All Tools button not found');
    fireEvent.click(allToolsBtn);

    const bmiCard = await screen.findByText('BMI Calculator');
    // The ToolListItem container has class "group"
    const container = bmiCard.closest('.group');
    if (!container) throw new Error('Tool container not found');
    
    // Find the heart icon in this container
    const heartIcon = container.querySelector('svg.lucide-heart');
    const favoriteBtn = heartIcon?.closest('button');
    if (!favoriteBtn) throw new Error('Favorite button not found');
    
    fireEvent.click(favoriteBtn);
    
    // Check header favorite count indicator
    const favNavBtn = screen.getAllByText(/Favorites/i).find(b => b.tagName === 'BUTTON');
    expect(favNavBtn?.textContent).toContain('1');
  });

  it('navigates to a specific tool view', async () => {
    render(<App />);
    const allToolsBtn = screen.getAllByText('All Tools').find(b => b.tagName === 'BUTTON');
    if (!allToolsBtn) throw new Error('All Tools button not found');
    fireEvent.click(allToolsBtn);

    const bmiLink = await screen.findByText('BMI Calculator');
    fireEvent.click(bmiLink);
    
    // The h1 in tool view has the tool name
    expect(await screen.findByRole('heading', { level: 1, name: /BMI Calculator/i })).toBeInTheDocument();
  });

  it('opens and uses the chatbot', async () => {
    render(<App />);
    
    // Find chat toggle - it's a fixed button at the bottom
    const buttons = screen.getAllByRole('button');
    const chatBtn = buttons.find(b => b.querySelector('svg.lucide-message-square'));
    
    if (!chatBtn) throw new Error('Chat button not found');
    fireEvent.click(chatBtn);
    
    expect(await screen.findByText(/Astro AI Guide/i)).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText(/Ask Astro anything/i);
    fireEvent.change(input, { target: { value: 'How do I use BMI?' } });
    
    const actionButtons = screen.getAllByRole('button');
    const sendButton = actionButtons.find(b => b.querySelector('svg.lucide-send'));
    
    if (!sendButton) throw new Error('Send button not found');
    fireEvent.click(sendButton);
    
    expect(await screen.findByText('Hello from Astro!')).toBeInTheDocument();
  });

  it('increments points on share from tool detail view', async () => {
    const user = userEvent.setup();
    render(<App />);
    const allToolsBtn = screen.getAllByText('All Tools').find(b => b.tagName === 'BUTTON');
    if (!allToolsBtn) throw new Error('All Tools button not found');
    await user.click(allToolsBtn);

    const bmiLink = await screen.findByText('BMI Calculator');
    await user.click(bmiLink);
    
    // Initial points 0
    expect(screen.getByText(/0 PTS/i)).toBeInTheDocument();
    
    const shareBtn = await screen.findByText(/SHARE FOR \+20 PTS/i);
    await user.click(shareBtn);
    
    // Points should increase by 20
    expect(await screen.findByText(/20 PTS/i)).toBeInTheDocument();
  });

  it('submits a tool suggestion successfully', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Mock successful feedback response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'success' }),
    });

    const suggestionSection = screen.getByText(/Suggest a New Tool/i);
    expect(suggestionSection).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Tool Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const descInput = screen.getByPlaceholderText(/Tell us what this tool should calculate/i);
    const submitBtn = screen.getByText(/SUBMIT SUGGESTION/i);

    await user.type(nameInput, 'Crypto Profit Calc');
    await user.type(emailInput, 'tester@example.com');
    await user.type(descInput, 'A tool to calculate arbitrage opportunities in crypto.');

    await user.click(submitBtn);

    expect(await screen.findByText(/LOGGED SUCCESSFULLY/i)).toBeInTheDocument();
    expect(screen.getByText(/Our logic-engineers have been notified/i)).toBeInTheDocument();
  });

  it('tracks recently used tools and displays them on home page', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Navigate to All Tools
    const allToolsBtn = screen.getAllByText('All Tools').find(b => b.tagName === 'BUTTON');
    if (!allToolsBtn) throw new Error('All Tools button not found');
    await user.click(allToolsBtn);

    // Open BMI Calculator
    const bmiLink = await screen.findByText('BMI Calculator');
    await user.click(bmiLink);
    expect(screen.getByText('BMI Calculator')).toBeInTheDocument();

    // Go back Home via Navigation button
    const homeBtn = screen.getAllByText('Home').find(b => b.tagName === 'BUTTON');
    if (!homeBtn) throw new Error('Home button not found');
    await user.click(homeBtn);

    // Check Recently Used section
    expect(await screen.findByText(/Recently Used/i)).toBeInTheDocument();
    
    // Check if BMI Calculator is in Recently Used (within the home view)
    const recentlyUsedSection = (await screen.findByText(/Recently Used/i)).closest('section');
    if (!recentlyUsedSection) throw new Error('Recently Used section not found');
    
    expect(within(recentlyUsedSection).getByText('BMI Calculator')).toBeInTheDocument();
  });

  it('updates document title for all tools and category views', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Check default title
    expect(document.title).toBe('AICalculator.shop | 53+ Free AI & Native Tools');

    // Navigate to All Tools
    const allToolsBtn = screen.getAllByText('All Tools').find(b => b.tagName === 'BUTTON');
    if (allToolsBtn) await user.click(allToolsBtn);
    expect(document.title).toBe('All 53 Calculators | AICalculator.shop');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Directory of 53+ free online calculators. Find the tool you need at AICalculator.shop.');

    // Navigate to Health category (from home, so go back home first)
    const homeBtn = screen.getAllByText('Home').find(b => b.tagName === 'BUTTON');
    if (homeBtn) await user.click(homeBtn);
    
    // Find Health & Fitness category card - use heading specifically
    const healthCard = await screen.findByRole('heading', { name: 'Health & Fitness', level: 3 });
    await user.click(healthCard.closest('div')!);
    
    expect(document.title).toBe('Health & Fitness | AICalculator.shop');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Optimize your biological machine. Explore our Health & Fitness tools at AICalculator.shop.');
  });

  it('filters tools by free and premium type', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Navigate to All Tools
    const allToolsBtn = screen.getAllByText('All Tools').find(b => b.tagName === 'BUTTON');
    if (!allToolsBtn) throw new Error('All Tools button not found');
    await user.click(allToolsBtn);

    // Initial state: Both types should be visible (e.g., BMI is Free, LLM is Premium)
    expect(await screen.findByText('BMI Calculator')).toBeInTheDocument();
    expect(await screen.findByText('LLM Token & Arbitrage Cost Estimator')).toBeInTheDocument();

    // Filter by Free Tools
    const freeToolsBtn = screen.getByText('Free Tools');
    await user.click(freeToolsBtn);
    expect(screen.getByText('BMI Calculator')).toBeInTheDocument();
    expect(screen.queryByText('LLM Token & Arbitrage Cost Estimator')).not.toBeInTheDocument();

    // Filter by Premium
    const premiumBtn = screen.getByText('Premium');
    await user.click(premiumBtn);
    expect(screen.queryByText('BMI Calculator')).not.toBeInTheDocument();
    expect(screen.getByText('LLM Token & Arbitrage Cost Estimator')).toBeInTheDocument();

    // Reset to All Types
    const allTypesBtn = screen.getByText('All Types');
    await user.click(allTypesBtn);
    expect(screen.getByText('BMI Calculator')).toBeInTheDocument();
    expect(screen.getByText('LLM Token & Arbitrage Cost Estimator')).toBeInTheDocument();
  });

  it('filters tools by search query in Category view', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Navigate to Health & Fitness category
    const healthCard = await screen.findByRole('heading', { name: 'Health & Fitness', level: 3 });
    await user.click(healthCard.closest('div')!);

    // Wait for the category header to appear in the main content
    const categoryHeader = await screen.findByRole('heading', { name: 'Health & Fitness', level: 1 });
    expect(categoryHeader).toBeInTheDocument();

    const resultsArea = screen.getByTestId('category-results');
    expect(within(resultsArea).getByText('BMI Calculator')).toBeInTheDocument();
    expect(within(resultsArea).getByText('TDEE Estimator')).toBeInTheDocument();

    // Search for "BMI" within category
    const searchInput = await screen.findByPlaceholderText(/Search Health & Fitness/i);
    await user.type(searchInput, 'BMI');

    expect(within(resultsArea).getByText('BMI Calculator')).toBeInTheDocument();
    // TDEE should be filtered out
    expect(within(resultsArea).queryByText('TDEE Estimator')).not.toBeInTheDocument();

    // Clear search using the X button
    const clearBtn = screen.getByLabelText('Clear search');
    await user.click(clearBtn);

    expect(within(resultsArea).getByText('TDEE Estimator')).toBeInTheDocument();
  });
});
