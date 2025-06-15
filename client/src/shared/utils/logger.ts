import chalk from "chalk";

export function logResponseStatus(response: Response) {
  let colorizedStatus = chalk.redBright(response.status);
  if (response.status >= 200 && response.status < 300) {
    colorizedStatus = chalk.greenBright(response.status);
  }

  console.log("🫵  " + chalk.blue("Response status: ") + colorizedStatus);
}

export async function logResponseBody(response: Response) {
  console.log(
    "🍅 " + chalk.blue("Response body: ") + chalk.yellow(await response.text())
  );
}

export function logResponseURL(response: Response) {
  console.log(
    "🔥 " + chalk.blue("Response URL: ") + chalk.yellowBright(response.url)
  );
}

export async function logBadResponse(response: Response): Promise<void> {
  logResponseStatus(response);
  logResponseURL(response);
  await logResponseBody(response);
}
