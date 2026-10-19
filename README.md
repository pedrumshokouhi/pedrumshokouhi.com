# pedrumshokouhi.com

Source for [pedrumshokouhi.com](https://pedrumshokouhi.com): twelve essays on how companies get built, funded and run, 25 founder case files, and 47 interactive machines you can play.

No framework, no build step, no dependencies. Plain HTML, CSS and JavaScript, served as static files.

## What is here

| Path | What it is |
|---|---|
| `index.html`, `about.html`, `world.html`, `experiments.html` | The main pages |
| `writing/` | The essays, one file each |
| `assets/lab/` | The machines: simulations of a refinery, a data center, a cell therapy, an electoral map, money flows, batch economics and more |
| `assets/3d/` | A small WebGL and SVG 3D renderer written from scratch (`gl.js`, `core.js`, `c2d.js`) with the isometric models the site uses, such as a capital stack and a money-flow map |
| `assets/theme.js`, `theme-picker.js` | Sixteen colour themes, each checked for WCAG AA contrast |
| `_redirects`, `sitemap.xml`, `robots.txt` | Routing, including the redirects that keep the old Blogger URLs alive |

Every machine honours reduced motion. Every page works on a phone first.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Deploy

The site is served from Cloudflare Workers static assets. Deployment is a stdlib-only Python script that uploads changed files through the Cloudflare REST API; it lives outside this repo with its credentials.

## License

Code is MIT, see [LICENSE](LICENSE). The essays, case files and images are copyright Pedrum Shokouhi and are not licensed for reuse.
