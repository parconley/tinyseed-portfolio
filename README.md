# TinySeed Portfolio 🌱

[**TinySeed Portfolio**](https://tinyseedportfolio.com/) uses _hybrid AI-powered search_ to find companies across TinySeed's entire portfolio of accelerator-backed companies. It combines semantic understanding with precise keyword matching and synonym handling, letting you search for broad concepts like "real estate technology" or specific terms like "CRM" and discover exactly what you're looking for.

![Screen recording of a search results page on TinySeed Portfolio](/public/tinyseed-portfolio-recording.gif)

Unlike simple keyword search, this intelligent search understands variations and synonyms (e.g., "e-commerce" finds "ecommerce", "AI" finds "artificial intelligence"), while ensuring results are precisely relevant to your query.

TinySeed Portfolio is built with [Next.js 14](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/). It uses [sentence-transformers](https://www.sbert.net/) for semantic indexing and search. The dataset is built by scraping TinySeed's portfolio page and enriching it with additional company information.

## How it works

TinySeed Portfolio uses a **hybrid search approach** that combines the best of both worlds:

### 1. **Semantic Understanding**
The search is powered by `all-mpnet-base-v2`, an advanced transformer model that computes high-dimensional embeddings for every company description. This allows the system to understand conceptual similarity between your search query and company descriptions.

### 2. **Precise Keyword Matching**
Every search result must contain at least one significant keyword from your query in the company description. This ensures results are directly relevant to what you're searching for.

### 3. **Intelligent Synonym Handling**
The system automatically expands searches with common variations and synonyms:
- "E-commerce" → finds "ecommerce", "commerce", "online store", "retail"
- "Real Estate" → finds "property", "construction", "residential", "commercial"
- "AI" → finds "artificial intelligence", "machine learning", "ML"
- "Transportation" → finds "vehicles", "EV", "electric vehicle", "automotive"

This hybrid approach eliminates irrelevant results while maintaining intelligent understanding of concepts and terminology variations.

The search results are then ranked by semantic similarity and presented with rich metadata for each company:

- Company name, website, and location
- Detailed company descriptions
- Cohort/batch information (e.g., "Spring 2025")
- Geographic region (Americas, EMEA)
- Podcast appearance status (Startups for the Rest of Us)
- Crunchbase links and company profiles
- Direct links to company websites

The UI presents all of this information in an intuitive interface that makes it easy to discover precisely relevant companies in the TinySeed ecosystem.

### Known features and capabilities

The current implementation of TinySeed Portfolio includes several powerful features:

- **Hybrid AI search**: Combines semantic understanding with precise keyword matching
- **Synonym handling**: Automatically handles variations (e-commerce/ecommerce, AI/artificial intelligence)
- **Two-stage filtering**: Results must pass both semantic similarity and keyword relevance tests
- **Podcast integration**: Shows which companies have appeared on Startups for the Rest of Us
- **Advanced filtering**: Filter by cohort, region, and podcast appearances
- **Cohort views**: Browse companies by their TinySeed batch
- **Company details**: Rich information including Crunchbase links and descriptions
- **Real-time search**: Instant, precise results as you type

## Updating the dataset

**TL;DR** — Run the scripts in the `scripts/` directory to update the company data and regenerate embeddings.

When new batches of TinySeed companies are announced or existing company information needs updating, we need to refresh the dataset that powers the semantic search. The process involves:

1. **Scraping the latest data**: Run `scripts/scrape-tinyseed-portfolio.js` to fetch the latest company information from TinySeed's website
2. **Processing and enriching**: Use `scripts/compile-all-companies.js` to combine and standardize the data
3. **Generating embeddings**: Run `scripts/generate-embeddings.js` to create semantic embeddings for each company's description

These steps produce updated files in the `app/data/` directory:
- `tinyseed-companies.json`: The raw company data
- `tinyseed-companies-with-embeddings.json`: Company data with semantic embeddings

The updated files should be checked into the repository and deployed to production.

## Development

TinySeed Portfolio is built with modern web technologies. Here's how to get started:

### Prerequisites

- Node.js 18+ and npm
- A code editor (VS Code recommended)

### Setup

```bash
# Clone the repository
git clone https://github.com/parconley/tinyseed-portfolio.git
cd tinyseed-portfolio/tinyseed-portfolio

# Install dependencies
npm install

# Run the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Common commands

- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm run start` — Run the production build locally
- `npm run lint` — Run ESLint
- `npm run type-check` — Run TypeScript type checking

### Project structure

```
tinyseed-portfolio/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── data/             # Company data and embeddings
│   └── utils/            # Utility functions
├── scripts/              # Data processing scripts
├── public/               # Static assets
└── design_screenshots/   # UI design references
```

## Deployment

TinySeed Portfolio is deployed using [Vercel](https://vercel.com/), which provides automatic deployments, serverless functions, and optimized performance for Next.js applications.

### Deploying to Vercel

1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts to link to your Vercel account
4. The site will be automatically deployed on each push to the main branch

### Manual deployment

For manual deployments or other platforms:
```bash
npm run build
npm start
```

The application runs on port 3000 by default.

## Contributing

Contributions are welcome! If you'd like to add features, fix bugs, or improve the documentation:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Related Projects

### Emergent Ventures Winners

This repository also includes **[Emergent Ventures Winners](https://evwinners.org)** (in the `ev-winners` directory), a similar semantic search interface for browsing recipients of the Emergent Ventures fellowship and grant program. The project uses the same underlying technology stack and search approach to help discover grantees working on innovative projects across various fields.

For more information about the EV Winners project, see the [ev-winners README](../ev-winners/README.md).

## Contact and More Information

This is an independent project showcasing TinySeed's portfolio companies. For questions, suggestions, or contributions, please open an issue on GitHub or contact the maintainers.

For more information about TinySeed, visit [tinyseed.com](https://tinyseed.com).