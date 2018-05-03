A Chinese character flash card game built in JavaScript with the goal of making Chinese less scary to the uninitiated.

A Chinese character flash card game built in JavaScript with the goal of making Chinese less scary to the uninitiated.

== 3000 goal


According to [the BBC](http://www.bbc.co.uk/languages/chinese/real_chinese/mini_guides/characters/characters_howmany.shtml), there are over 50,000 characters. An educated Chinese needs to know 8000 of them and 2-3000 are needed to read a newspaper.

This snippet when run on an appropriate selector can find some of those 3000.
```
const selector = '.story-body'
let allChars = document.querySelector(selector).textContent.replace(/[\n \t0-9A-Za-z\/\*\&\。\.\)\，\"\}\{\;\-\(\'\、\,\[\]\（\）\？\”\“\—\:\+\─]/g, '').split('');
uniqueChars = allChars.filter((char, i) => allChars.indexOf(char) === i);
JSON.stringify(uniqueChars)
```

So I'll run that snippet every week, I'll then import them into the repo:

```
> cli.js listOfCharacters.json
```
and then manually I'll go through the with the goal of learning them and somehow make them into a game.

Gulp.

== Configuration options

=== Environment variables

	export CLEAN_WORD_ORDER=1

when set on boot up, the user will revert to any new words that have been unanswered meaning their number of word count will decrease. Mostly being used for testing.
