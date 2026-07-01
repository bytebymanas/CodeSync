function getHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json"
  };
}

function encodeContent(content) {
  return btoa(unescape(encodeURIComponent(content)));
}

export async function testGitHubConnection(token) {
  const response = await fetch("https://api.github.com/user", {
    headers: getHeaders(token)
  });

  if (!response.ok) {
    throw new Error(`GitHub connection failed (${response.status})`);
  }

  return response.json();
}

export async function getFileMetadata({ token, owner, repo, branch, path }) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`, {
    headers: getHeaders(token)
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub read failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

export async function createOrUpdateFile({
  token,
  owner,
  repo,
  branch,
  path,
  message,
  content,
  sha
}) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    headers: getHeaders(token),
    body: JSON.stringify({
      message,
      content: encodeContent(content),
      branch,
      ...(sha ? { sha } : {})
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub write failed (${response.status}): ${errorText}`);
  }

  return response.json();
}
