// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require('playwright')
const path = require('path')

async function sortHackerNewsArticles (page, url, articlesTarget) {

  let currentArticle = 1
  let pageNo = 1
  let comparedArticleAge = '0000-00-00T00:00:00 0'
  let currentArtcileAge = '0000-00-00T00:00:00 0'
  let ordered = true

  // go to Hacker News
  //await page.goto('https://news.ycombinator.com/newest')
  await page.goto(url)

  //continue comparing timestamp of the current article to the next until we have processed 100 articles
  while (true) {
    //once per page
    let timestamps = await page.locator('.age').all()
    console.log(`Page ${pageNo} contains ${timestamps.length} articles`)

    //continue comparing timestamp of the current article to the next until we have gone through every article on the page
    for (let n = 0; n < timestamps.length - 1; n++) {
      console.log(
        'Article ' + currentArticle + ' ' + (await timestamps[n].textContent())
      )
      currentArtcileAge = await timestamps[n].getAttribute('title')
      currentAgeUnix = currentArtcileAge.split(' ')[1]

      //if this is the first article on the page, we need to compare it to the last article of the previous page
      if (pageNo != 1 && n == 0) {
        console.log(' Time1 ' + comparedArticleAge)
        console.log(' Time2 ' + currentArtcileAge)

        if (currentAgeUnix > comparedAgeUnix) {
          console.log(`Out of order at position ${comparedArticleAge}:`)
          console.log(
            `${currentArtcileAge} should come before ${currentArticle}`
          )
          ordered = false
          return ordered
        }
        currentArticle++
        console.log(`Processed ${currentArticle} articles`)
      }

      //continue comparing timestamps
      comparedArticleAge = await timestamps[n + 1].getAttribute('title')
      comparedAgeUnix = comparedArticleAge.split(' ')[1]
      console.log(' Time1 ' + currentArtcileAge)
      console.log(' Time2 ' + comparedArticleAge)

      if (currentAgeUnix < comparedAgeUnix) {
        console.log(`Out of order at position ${currentArticle}:`)
        console.log(
          `${currentArtcileAge} should come before ${comparedArticleAge}`
        )
        ordered = false
        return ordered
      }

      currentArticle++

      console.log(`Processed ${currentArticle} articles`)
      if (currentArticle == articlesTarget) {
        return ordered
      }
    }

    if (currentArticle == articlesTarget) {
      return ordered
    }
    await page.getByRole('link', { name: 'More', exact: true }).click()
    pageNo++
  }
}



// start
;(async () => {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()
  let score = 0

  // Test pages
  const testPages = [
    [false,10,'file://' + path.resolve(__dirname, 'test-failed-validation.html')], // Local page with error in time order
    [true,30,'file://' + path.resolve(__dirname, 'test-passed-validation.html')], // Local page with correct time order
    [true,100,'https://news.ycombinator.com/newest'] // Real Hacker News page
  ]

  // validate and print results
  for (const t of testPages) {
    
    console.log('Testing:' + t[2] + "\n")
    console.log(`Testing: ${t[2]}`, t[0] ? ' (should pass)' : ' (should fail)')
    const result = await sortHackerNewsArticles(page, t[2], t[1])
    if (result) {
      console.log('Validation passed.')
      t[3] = true
    } else {
      console.log('Validation failed.')
      t[3] = false
    }
  }

  console.log('\nRESULT: ')

  for (const t of testPages) {
    console.log(` Test on: ${t[2]}`, t[0] ? ' (should pass)' : ' (should fail)' , t[3] ? '- (passed)' : '- (failed)')
    if (t[0] == t[3]) {
      score++
    } 
  }

  if (score == 3) {
    console.log('All tests passed.')
  } else {
    console.log('Some tests failed')
  }
  

  console.log('All tests Completed.')

  await browser.close()
})()
