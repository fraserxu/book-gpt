const markdownFileRegex = /\.md$/

const parseGitHubUrl = (url: string) => {
  const regex =
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)(\/.+)?$/
  const match = url.match(regex)

  if (!match) {
    throw new Error("Invalid GitHub URL")
  }

  return {
    username: match[1],
    repoName: match[2],
    branchName: match[3],
    folderName: match[4] ? match[4].substring(1) : "",
  }
}

const buildApiUrl = (url: string) => {
  const { username, repoName, branchName, folderName } = parseGitHubUrl(url)

  const apiBase = "https://api.github.com"
  const githubRepo = `${username}/${repoName}`
  return `${apiBase}/repos/${githubRepo}/contents/${folderName}?ref=${branchName}`
}

export const fetchContentFromGithubUrl = async (url: string, token: string) => {
  const apiUrl = buildApiUrl(url)
  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `token ${token}`,
    },
  })

  const files = await response.json()
  const markdownFiles = files.filter((file) =>
    markdownFileRegex.test(file.name)
  )
  const markdownPromises = markdownFiles.map(async (markdownFile) => {
    const contentResponse = await fetch(markdownFile.download_url)
    const markdownContent = await contentResponse.text()
    return markdownContent
  })

  return Promise.all(markdownPromises)
}
