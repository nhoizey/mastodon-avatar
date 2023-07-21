// Regex for Mastodon usernames: https://regex101.com/library/ac4fG5
const MASTODON_USERNAME_REGEX =
  /^@?\b([A-Z0-9._%+-]+)@([A-Z0-9.-]+\.[A-Z]{2,})\b$/i;

export default async (request, context) => {
  const url = new URL(request.url);
  const username = url.searchParams.get("username");

  const matches = username.match(MASTODON_USERNAME_REGEX);
  if (matches.length !== 3) {
    return await fetch("https://placekitten.com/g/400/400");
  }

  const [full, user, server] = matches;
  const response = await fetch(
    `https://${server}/api/v2/search?type=accounts&q=@${user}&limit=1`
  );
  const data = JSON.parse(await response.text());
  const avatarUrl = data.accounts[0].avatar_static;
  return await fetch(avatarUrl);
};

export const config = { path: "/" };
