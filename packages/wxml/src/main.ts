import { Parser } from '../lib/parser'


const parser = new Parser({
  onOpenTag(name, attributes) {
    console.log("-->", name, attributes)
  },
  onText(text) {
    /*
     * Fires whenever a section of text was processed.
     *
     * Note that this can fire at any point within text and you might
     * have to stitch together multiple pieces.
     */
    console.log("-->", text);
  },
  onCloseTag(tagname) {
    console.log("-->", tagname)
  },
})
parser.write(
  `<view>1</view><view wx:else>2</view>`
)
parser.end()