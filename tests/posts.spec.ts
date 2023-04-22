import { test, expect } from '@playwright/test'
import { cartesianProduct } from '@utils/tests'

test.describe('Posts', () => {
  for (const [path, lang] of cartesianProduct(
    ['/posts', '/tags/git'],
    ['en', 'pt']
  )) {
    test(`blog post should have correct link (in ${lang} and ${path})`, async ({
      page,
    }) => {
      const urlPrefix = lang === 'pt' ? '/pt' : ''

      await page.goto(`${urlPrefix}${path}`)

      if (lang === 'pt') {
        await expect(
          page.getByRole('link', { name: 'Desmistificando git rebase' })
        ).toHaveAttribute('href', `/pt/posts/demystifying-git-rebase`)
      } else {
        await expect(
          page.getByRole('link', { name: 'Demystifying git rebase' })
        ).toHaveAttribute('href', `/posts/demystifying-git-rebase`)
      }
    })
  }
})
