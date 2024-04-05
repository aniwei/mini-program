pub mod css;
pub mod element;
pub mod prelude;


#[cfg(test)]
mod tests {
  use self::element::Element;

use super::*;

  #[test]
  fn test_element() {
    // Test your element module here
    // ...
    let source = r#"
      <div>
        <p>hello</p>
      </div>"#;

    let root = Element::build(source.as_bytes());
    println!("{:?}", root);
  }

  #[test]
  fn test_prelude() {
    // Test your prelude module here
    // ...
  }
}
