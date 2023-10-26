## Release Radar

Not to be confused with the Spotify product of the same name :)

### What is it?

Release Radar checks GitHub Repos every 12 hours (configurable with `wrangler.toml`) and notifies you via Discord when a release is made.

### How to use it?

1. Create a worker (just deploy this repo)
2. Create this KV namespace:
   - `npx wrangler kv:namespace create repos`
   - `npx wrangler kv:namespace create repos --preview` (optional)
3. Set the returned IDs appropriately `wrangler.toml`
4. Define these secrets:
   - `npx wrangler secret put DISCORD_WEBHOOK_URL`
   - `npx wrangler secret put GITHUB_TOKEN` (optional)
5. In your Cloudflare Dashboard for wherever you deployed this repo, navigate to the newly created KVs:
   - **Workers & Pages** > **KV**
6. Add the repos you want to target with **no value**. Just the key.

	 Example:
	 	<ul> <!--random html, i choose you!-->
	    <li>Key: `dejaydev/release-radar`</li>
		  <li>Value: ` `</li>
		</ul>
5. Redeploy this repo.
6. wait.

## License

This project uses the [MIT License](./LICENSE), which allows you to freely use, copy, modify, and distribute the software for any purpose, with the condition that you include the original copyright notice and the MIT License text in your copies. However, there are also limitations: you cannot hold the copyright holders liable for any issues, remove or modify the MIT License text, or use the names of the copyright holders for endorsements without permission.

## Minor Updates (Upon Request):

Upon request, I may provide minor updates or improvements to this software. Please open an issue to get in touch.
