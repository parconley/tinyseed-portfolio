# TinySeed Portfolio 🌱

[**TinySeed Portfolio**](https://tinyseedportfolio.com/) uses _semantic similarity_ to search TinySeed's entire portfolio of accelerator-backed companies by descriptions of ideas or verticals rather than keywords or categories, which lets you search for something super broad like "sustainable agriculture" as well as specific ideas like "developer productivity tools" and see who's building in the space (at least, in the TinySeed community).

![Screen recording of a search results page on TinySeed Portfolio](/public/tinyseed-portfolio-recording.gif)

Unlike the simple text search box in TinySeed's [portfolio page](https://tinyseed.com/portfolio), semantic search means this search bar doesn't need you to get the keywords exactly right, only close enough to what startups are building, to find them.

TinySeed Portfolio is built with [Next.js 14](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/). It uses [sentence-transformers](https://www.sbert.net/) for semantic indexing and search. The dataset is built by scraping TinySeed's portfolio page and enriching it with additional company information.

## How it works

TinySeed Portfolio performs semantic search using transformer-based language models to understand the conceptual similarity between search queries and company descriptions. This is particularly valuable for the TinySeed ecosystem where companies are often working on innovative solutions that don't fit neatly into traditional categories.

The semantic search is powered by `sentence-transformers/all-MiniLM-L6-v2`, which computes sentence/paragraph embeddings for every company description. When you search, the system finds companies whose descriptions are semantically similar to your query, even if they don't contain the exact keywords you used.

There's a practical reason a sophisticated model is needed for TinySeed Portfolio: startup pitches and descriptions tend to involve lots of industry-specific terminology and often speak about problems and solutions rather than just products. Transformer-based models excel at understanding these nuanced descriptions and finding conceptual similarities.

Once sentence embeddings are used to compute semantic "neighbors" of an idea or company description, TinySeed Portfolio collects and displays rich metadata about each company:

- Company name, website, and location
- One-line and extended descriptions
- Cohort/batch information (e.g., "Spring 2025")
- Geographic region (Americas, EMEA)
- Industry tags and categories
- Founder information (where available)
- Social media and other relevant links

The UI then presents all of this information in an intuitive, searchable interface that makes it easy to discover relevant companies in the TinySeed ecosystem.

### Known features and capabilities

The current implementation of TinySeed Portfolio includes several powerful features:

- **Semantic search**: Find companies by concepts, not just keywords
- **Advanced filtering**: Filter by cohort, region, industry, and more
- **Cohort views**: Browse companies by their TinySeed batch
- **Company details**: Rich information pages for each portfolio company
- **Similar companies**: Discover related startups based on semantic similarity
- **Real-time search**: Instant results as you type

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