use crate::Source;
use crate::Asset;

/// 图片资源
pub struct Image {
  source: Source<String>
}
  
impl Image {
  pub fn new(
    relative_path: &str,
    base_path: &str,
    index: usize,
  ) -> Self {
    let source = Source::new(
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
  
/// 实现资源特性
impl <'a> Asset for Image {
  // 获取资源对象
  fn get_source(&self) -> &Source<&str> {
    &self.source
  }

  // 获取资源对象
  fn get_mut_source(&mut self) -> &mut Source<&str> {
    &mut self.source
  }
}