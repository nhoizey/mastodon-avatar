// Regex for Mastodon usernames: https://regex101.com/library/ac4fG5
const MASTODON_USERNAME_REGEX =
  /^@?\b([A-Z0-9._%+-]+)@([A-Z0-9.-]+\.[A-Z]{2,})\b$/i;

export default async (request, context) => {
  // console.dir(request);
  const url = new URL(request.url);
  const username = url.searchParams.get("username");

  if (!username) {
    console.log(`No username defined: ${request.url}`);
    return await fetch("https://dummyimage.com/400x400&text=No+username");
  }

  const matches = username.match(MASTODON_USERNAME_REGEX);
  if (matches.length !== 3) {
    console.log(`No Mastodon username matched: ${JSON.stringify(matches)}`);
    return await fetch(
      "https://dummyimage.com/400x400&text=Wrong+username+format"
    );
  }

  const [, user, server] = matches;
  const webfingerUrl = `https://${server}/.well-known/webfinger?resource=acct:${user}@${server}`;

  let response;
  try {
    response = await fetch(webfingerUrl);
  } catch (error) {
    console.log(`Couldn't fetch from webfinger URL: ${webfingerUrl}`, error);
    return await fetch(
      `https://dummyimage.com/400x400/639/fff.png&text=Fetch+error:+${error}`
    );
  }

  try {
    const data = JSON.parse(await response.text());
    if (data.links.length === 0) {
      console.log(`No webfinger link found for user ${username}`);
      return await fetch(
        "https://dummyimage.com/400x400/639/fff.png&text=No+webfinger+link"
      );
    }

    let avatarUrl = "";
    data.links.forEach((link) => {
      if (link.rel === "http://webfinger.net/rel/avatar") {
        avatarUrl = link.rel.href;
      }
    });

    if (avatarUrl === "") {
      console.log(`No avatar found in webfinger data for user ${username}`);
      return await fetch(
        "https://dummyimage.com/400x400/639/fff.png&text=No+avatar"
      );
    }

    return await fetch(avatarUrl);
  } catch (error) {
    console.log(`Couldn't fetch from webfinger URL: ${webfingerUrl}`, error);
    return await fetch(
      `https://dummyimage.com/400x400/639/fff.png&text=Error:+${error}`
    );
  }
};

export const config = { path: "/" };
