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
    const apiUrl = `https://mastodon.social/api/v2/search?type=accounts&q=@${user}@${server}&limit=1`;
    const response = await fetch(apiUrl);

    const data = JSON.parse(await response.text());
    if (data.accounts.length === 0) {
      console.log(`No data from API for user ${username}`);
      return await fetch("https://placekitten.com/g/400/400");
    }

    const avatarUrl = data.accounts[0].avatar_static;
    return await fetch(avatarUrl);
  } catch (error) {
    console.log(`Couldn't fetch from API: ${apiUrl}`, error);
    return await fetch("https://placekitten.com/g/400/400");
  }
};

export const config = { path: "/" };
