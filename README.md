# Nuance Hunt

**Can you catch what AI missed?**

Nuance Hunt is a local-first workbench for comparing how AI models respond across languages. Add a prompt in two languages, paste the model responses, and invite fluent speakers to review meaning, accuracy, and naturalness. Export a reproducible result card when you are ready to share it.

The first version does not call an AI service. It does not need an API key, account, or server. Your drafts stay in this browser until you export or clear them.

## Try it

Open `index.html` in a browser. Create an evaluation with two language versions of the same task, paste the responses you want to compare, and rate each response. Your saved cards appear on the page and can be exported as JSON following [`data/evaluation.schema.json`](data/evaluation.schema.json).

For a fair comparison, use the same model and settings for both language prompts. Keep personal, confidential, or copyrighted material out of test cards unless you have permission to share it.

## What we are trying to make easier

AI evaluations often report a single score that hides how much performance can change between languages, dialects, and code-switching. Nuance Hunt makes an individual comparison easy to inspect: the original prompt, its translation or adaptation, the model and settings, both responses, the review criteria, and any supporting source can travel together as one card.

This is an evaluation workbench, not a leaderboard. A few community ratings do not prove that a model is reliable in a language. We will only publish aggregate comparisons after defining a careful method and recruiting qualified reviewers.

## Current prototype

- Compare two prompt/response pairs side by side.
- Record whether prompts are a direct translation, cultural adaptation, or independently written equivalent.
- Record language, task, model, settings, and optional source notes.
- Review each response for meaning, factual accuracy, and naturalness.
- Save drafts in browser storage.
- Export or delete result cards.
- No network calls, API keys, account, or remote storage.

## Roadmap

1. Turn the comparison workbench into a playful “spot the meaning drift” challenge with fluent speakers and AI researchers.
2. Agree on a small set of human-reviewed comparison tasks and clear rating guidance.
3. Add import support for compatible public benchmarks and strengthen reproducible run metadata.
4. Explore adapters for local and hosted model endpoints, with explicit consent and secret handling.
5. Add aggregate views only when sample sizes and reviewer quality support them.

We will build alongside existing African-language benchmark projects and seek compatible datasets rather than copy or relabel their work. See [the project notes](docs/research-notes.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [community code of conduct](CODE_OF_CONDUCT.md). Helpful early contributions include usability feedback from fluent speakers, accessibility improvements, rating rubric review, and adapters for public benchmark formats.

## License

MIT. See [LICENSE](LICENSE).
