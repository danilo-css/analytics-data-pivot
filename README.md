# Analytics Data Pivot (ADPivot)

Analytics Data Pivot (ADPivot) is a no code tool that helps build pivot tables from databases of any size with a few clicks. You can access a live version of the app through the link: [https://datapivot.analyticsdata.pro/](https://datapivot.analyticsdata.pro/).

The databases have to be in the Apache Parquet (.parquet) format. ADPivot also supports uploading Excel spreadsheets (.xlsx), selecting a sheet and converting it to a Parquet file that can be used in the application. Support for CSV files is being considered for future versions.

![ADPivot](public/adpivot_snapshot.png)

## ADPivot advantages

- **Client-side**. The application is run entirely on the client (on the user's device) without the need to send any data to a server, allowing fast interactivity and increased security.
- **Table focused**. Unlike similar solutions, this tool is completely focused on creating pivot tables. No overhead for trying to handle charts.
- **Relational**. Multiple databases can be added to allow relational database analytics.
- **MultiIndex**. The resulting pivot table then can be visualized or downloaded preserving the MultiIndex (hierarchical index) structure defined in the application.
- **Fast**. Under the hood, ADPivot uses [WebAssembly](https://webassembly.org/) [DuckDB](https://github.com/duckdb/duckdb-wasm) and [Pyodide](https://github.com/pyodide/pyodide) for maximum querying performance. On the front-end side, [React](https://github.com/facebook/react) and [Next.js](https://github.com/vercel/next.js) provide the best UI performance.
- **Open-source and free:** ADPivot is completely open-source licensed under the MIT license.

See the [launch article](https://analyticsdata.pro/blog/Analytics%20Data%20Pivot%20(ADPivot)%20launch) for further details. 

## How to use it

You can use the ADPivot app that's currently hosted on my server in the link: https://datapivot.analyticsdata.pro/

Or you can install [Node.js](https://nodejs.org/en/download), clone the repository, and deploy locally running these commands sequentially in the project folder (the application will run in http://localhost:3000/): 

```bash
npm install --force
```

```bash
npm run build
```

```bash
npm start
```

You can also deploy ADPivot to your own server. This requires knowledge of [Docker](https://www.docker.com/get-started/) and cloud infrastructure in general. A Dockerfile is provided in the main folder of the repository to help users with this task.

## Contribute

If ADPivot is useful to you, you can help me keep the app up on my server and develop it further by making a donation through [GitHub sponsor program](https://github.com/sponsors/danilo-css?frequency=one-time&sponsor=danilo-css) or through [PayPal](https://www.paypal.com/donate/?business=VM8L5KP6R5FQY&no_recurring=0&item_name=Thank+you+for+donating.+Your+money+goes+toward+covering+server+expenses+and+developing+the+app+further.&currency_code=USD). I'm also open to freelancing gigs using the tech stack of this application. You can reach out to me through the e-mail [contact@analyticsdata.pro](mailto:contact@analyticsdata.pro).

If you're a user with no coding experience you can open an [issue](https://github.com/danilo-css/analytics-data-pivot/issues) and try to explain bugs or suggestions you might have to enhance the application.

If you're a developer and want to contribute with code, I currently don't have much time to review [pull requests](https://github.com/danilo-css/analytics-data-pivot/pulls), but your pull request will be considered if you can explain clearly what the purpose is, how it is done and it clearly solves a bug or improves features of the application using React, Next.js, TypeScript and the other core dependencies that were used to build the app.

## Sponsors

Permanently add your company, website, or GitHub profile link and description here in this README section by [becoming a one-time sponsor](https://github.com/sponsors/danilo-css?frequency=one-time&sponsor=danilo-css) of this open-source project.

These are our current sponsors, from latest to earliest:

- [AnalyticsData.Pro](https://analyticsdata.pro/) - Building and deploying data analytics tools that run on the browser.
