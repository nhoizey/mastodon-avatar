// Regex for Mastodon usernames: https://regex101.com/library/ac4fG5
const MASTODON_USERNAME_REGEX =
  /^@?\b([A-Z0-9._%+-]+)@([A-Z0-9.-]+\.[A-Z]{2,})\b$/i;

export default async (request, context) => {
  // console.dir(request);
  const url = new URL(request.url);
  const username = url.searchParams.get("username");

  if (!username) {
    console.log(`No username defined: ${request.url}`);
    return await fetch("https://placekitten.com/g/400/400");
  }

  const matches = username.match(MASTODON_USERNAME_REGEX);
  if (matches.length !== 3) {
    console.log(`No Mastodon username matched: ${JSON.stringify(matches)}`);
    return await fetch("https://placekitten.com/g/400/400");
  }

  const [, user, server] = matches;
  try {
    const webfingerUrl = `https://${server}/.well-known/webfinger?resource=acct:${user}@${server}`;
    const response = await fetch(webfingerUrl);

    const data = JSON.parse(await response.text());
    if (data.links.length === 0) {
      console.log(`No webfinger link found for user ${username}`);
      return await fetch("https://placekitten.com/g/400/400");
    }

    let avatarUrl = "";
    data.links.forEach((link) => {
      if (link.rel === "http://webfinger.net/rel/avatar") {
        avatarUrl = link.rel.href;
      }
    });

    if (avatarUrl === "") {
      console.log(`No avatar found in webfinger data for user ${username}`);
      return await fetch("https://placekitten.com/g/400/400");
    }

    return await fetch(avatarUrl);
  } catch (error) {
    console.log(`Couldn't fetch from webfinger URL: ${webfingerUrl}`, error);
    return await fetch("https://placekitten.com/g/400/400");
  }
};

export const config = { path: "/" };
