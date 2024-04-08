pub mod css;
pub mod element;
pub mod prelude;
pub mod template;


#[cfg(test)]
mod tests {
  use self::element::Element;

use super::*;

  #[test]
  fn test_element() {
    // Test your element module here
    // ...
    let source = r#"
      <view class="view">
        <text>hello</text>
      </view>"#;

    let root = Element::build(source.as_bytes());
    println!("{:?}", root);
  }

  #[test]
  fn test_prelude() {
    // Test your prelude module here
    // ...
  }
}
