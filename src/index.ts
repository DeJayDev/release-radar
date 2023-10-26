import { request } from "@octokit/request";
import { Endpoints } from "@octokit/types";
import { RESTPostAPIWebhookWithTokenJSONBody } from 'discord-api-types/v10'
import semver from 'semver';

export interface Env {
	repos: KVNamespace;
	DISCORD_WEBHOOK_URL: string;
	GITHUB_TOKEN?: string;
}

export default {
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		if(!env.DISCORD_WEBHOOK_URL) {
			console.log("No configured webhook URL. Stopping immediately.")
			return; // not worth any effort.
		}

		const kv = await env.repos.list();
		const repos: string[] = kv.keys.map((key) => key.name);

		const octokitSettings = {
			headers: {
				'X-GitHub-Api-Version': '2022-11-28',
			}
		}

		if(env.GITHUB_TOKEN) {
			(octokitSettings.headers as any)['Authorization'] = `Bearer ${env.GITHUB_TOKEN}`
		}

		for await (const repo of repos) {
			let res = (await request(`GET /repos/${repo}/releases/latest`, {
				...octokitSettings
			})) as Endpoints['GET /repos/{owner}/{repo}/releases/latest']['response']

			const release = res.data;
			const latest = release.tag_name;

			if(release.draft || release.prerelease) {
				continue;
			}

			const current = await env.repos.get(repo);

			let alert = false;

			console.log("Current: " + current)
			console.log("Latest: " + latest)
			if(!current) {
				env.repos.put(repo, latest);
				ctx.waitUntil(sendPlainWebhook(`Now tracking ${repo} from ${latest}`, env));
				continue
			}

			if(semver.valid(latest)) { // if we pulled a semver version
				alert = semver.lt(current, latest);
			} else {
				alert = current !== latest;
			}

			if(!alert) {
				continue;
			}

			env.repos.put(repo, latest);

			await fetch(env.DISCORD_WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					content: `New release of ${repo}!`,
					embeds: [{
						title: repo,
						fields: [
							{
								name: 'Released',
								value: `<t:${new Date(release.published_at!).getTime() / 1000}:f>`,
								inline: true
							},
							{
								name: 'Version',
								value: latest,
								inline: true
							}
						],
						timestamp: new Date().toISOString()
					}]
				} as RESTPostAPIWebhookWithTokenJSONBody)
			});
		}
	},

	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return new Response('Hello, World!');
	},
};

async function tell(message: string) {
	console.log(message)
}

async function sendPlainWebhook(message: string, env: Env) {
	console.log(env.DISCORD_WEBHOOK_URL);
	const test = await fetch(env.DISCORD_WEBHOOK_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
		body: JSON.stringify({
			content: message,
		})
	})
	console.log(await test.text())
	console.log(message)
}
