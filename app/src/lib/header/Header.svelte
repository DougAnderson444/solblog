<script>
	import { page } from '$app/stores';
	import logo from './sblogo.svg';
	import { MAIN_NET, DEV_NET } from '$lib/constants.js';
	import { selectedNetwork } from '$lib/stores';
</script>

<header>
	<div class="corner">
		<a href="/">
			<img src={logo} alt="SolBlog" />
		</a>
	</div>

	<nav>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
		</svg>
		<ul>
			<li class:active={$page.path === '/'}><a sveltekit:prefetch href="/">Home</a></li>
			<li class:active={$page.path.startsWith('/blog')}>
				<a sveltekit:prefetch href="/blog">Blog</a>
			</li>
			<li class:active={$page.path === '/cheatcodes'}>
				<a sveltekit:prefetch href="/cheatcodes">Cheat Codes</a>
			</li>
		</ul>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
		</svg>
	</nav>

	<div class="corner">
		<!-- TODO put something else here? github link? -->
		<select class="fancy-dropdown" bind:value={$selectedNetwork}>
			<option value={DEV_NET}>DevNet</option>
			<option value={MAIN_NET}>Mainnet</option>
		</select>
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}

	.corner {
		width: 10em;
		height: 4em;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 8em;
		height: 4em;
		object-fit: contain;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: rgba(255, 255, 255, 0.7);
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li.active::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--accent-color);
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 1em;
		color: var(--heading-color);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--accent-color);
	}

	.fancy-dropdown {
		margin: 1em 1em;
		background-color: rgb(64, 64, 64); /* Green */
		background-image: linear-gradient(45deg, #c636f6, #14eaab);
		border: none;
		color: rgb(231, 231, 231);
		padding: 15px 32px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 16px;
		margin-left: auto;
		border-radius: 2px;
		filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
	}
	option {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		padding: 5px;
	}
</style>
