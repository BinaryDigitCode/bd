const parser = new DOMParser();
const location = window.location.hostname;

function strip(html){
	let doc = parser.parseFromString(html, 'text/html');
	return doc.body.textContent || "";
}

async function rss2html(url, max) {
	if (location !== "127.0.0.1") {
		url = `/rewrite/${url.replace(/^https?\:\/\//i, "")}`;
	}
	const rssResponse = await fetch(url);
	const rssText = await rssResponse.text();
	const doc = parser.parseFromString(rssText, "application/xml");
	window.rssDocs ??= {};
	Object.assign(window.rssDocs, { [url]: doc });
	const title = doc.querySelector("channel > title, feed > title").textContent;
	const link =
		doc.querySelector("channel > link")?.textContent ||
		doc.querySelector("feed > link:not([rel])")?.getAttribute("href");
	const maxItems = parseInt(max, 10) || Infinity;
	const items = Array.from(doc.querySelectorAll("channel > item, feed > entry"))
		.slice(0, maxItems)
		.map((item) => ({
			title: item.querySelector("title").textContent,
			link:
				item.querySelector("link")?.textContent ||
				item.querySelector("link")?.getAttribute("href"),
			description: item.querySelector("description")?.textContent.length > 100
			? strip(item.querySelector("description").textContent).substring(0,100)+"..."
			: item.querySelector("description")?.textContent,
		}));
	return/*html*/ `<article style="--hue: ${Math.random() * 360}">
		<h2 class="feed-title">
			${
				link
				? /*html*/ `<a href="${link}" target="_blank">${title}</a>`
				: title
			}
		</h2>
		${items.map(
			(item) => /*html*/ `
				<h3 class="feed-item-title">
					<a href="${item.link}" target="_blank">${item.title}</a>
				</h3>
				${item.description 
					? `<div class="feed-item-desc">${item.description}</div>`
					: ""
				}
			`
		).join("")}
		</article>`;
}
class RssList extends HTMLElement {
	static observedAttributes = ["src", "max"];
	pending = false;

	constructor() {
		super();
	}

	update() {
		if (!this.getAttribute("src") || this.pending) return;
		this.innerHTML = `<article style="background-color: hsla(0, 0%, 50%, 0.1); display: grid; place-content: center"><p>Loading ${this.getAttribute("src")}</p></article>`;
		this.pending = true;
		rss2html(this.getAttribute("src"), this.getAttribute("max")).then(
			(html) => {
				this.innerHTML = html;
				this.pending = false;
			}
		);
	}

	connectedCallback() {
		this.update();
	}

	attributeChangedCallback(name) {
		if (["max", "src"].includes(name)) {
			this.update();
		}
	}
}

customElements.define("rss-list", RssList);