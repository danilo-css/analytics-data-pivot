# Analytics Data Pivot (ADP)

Analytics Data Pivot (ADP) is a no-code tool that helps build pivot tables from databases of any size with a few clicks.

The databases have to be in the Apache Parquet (.parquet) format. ADP also supports uploading Excel spreadsheets (.xlsx), selecting a sheet and converting it to a Parquet file that can be used the in the application.

## ADP advantages

- **Client-side**. The application is run entirely on the client (on the user's device) without the need to send any data to a server, allowing fast interactivity and increased security.
- **Table focused**. Unlike similar solutions, this tool is completely focused on creating pivot tables. No overhead for trying to handle charts.
- **Relational**. Multiple databases can be added to allow relational database analytics.
- **MultiIndex**. The resulting pivot table then can be visualized or downloaded preserving the MultiIndex (hierarchical index) structure defined in the application.
- **Fast**. Under the hood, ADP uses [WebAssembly](https://webassembly.org/) [DuckDB](https://github.com/duckdb/duckdb-wasm) and [Pyodide](https://github.com/pyodide/pyodide) for maximum querying performance. On the front-end side, [React](https://github.com/facebook/react) and [Next.js](https://github.com/vercel/next.js) provide the best UI performance.
- **Open-source and free:** ADP is completely open-source licensed under the Apache 2.0 license.

## How to use it

You can use ADP that's currently hosted on my personal server in the link: https://datapivot.analyticsdata.pro/

Or you can install [Node.js](https://nodejs.org/en/download), clone the repository, and run locally running these commands sequentially in the project folder (the application will run in http://localhost:3000/): 

1
```bash
npm install
```

2
```bash
npm run build
```

3
```bash
npm start
```

## Contribute

If ADP is useful to you, you can help me develop it further by making a donation in the following link: 

I am also
