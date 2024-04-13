use crate::Source;
use crate::Asset;
use crate::Element;

/// XML 资源
pub struct XML {
  source: Source<Element>
}
  
impl XML {
  pub fn new(
    relative_path: &str,
    base_path: &str,
    index: usize,
  ) -> Self {
    let source = Source::<str>::new(
      relative_path, 
      base_path, 
      None, 
      index
    );

    Self {
      source
    }
  }
}
  
impl Asset for XML {
  // 获取资源对象
  fn get_source<T>(&self) -> &Source<Element> {
    &self.source
  }

  // 获取资源对象
  fn get_mut_source<T>(&mut self) -> &mut Source<Element> {
    &mut self.source
  }
}