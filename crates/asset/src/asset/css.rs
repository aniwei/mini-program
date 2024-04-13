use crate::Source;
use crate::Asset;

/// CSS 资源
pub struct CSS {
  source: Source<String>
}
  
impl CSS {
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

impl Asset for CSS {
  // 获取资源对象
  fn get_source(&self) -> &Source<String> {
    &self.source
  }

  // 获取资源对象
  fn get_mut_source(&mut self) -> &mut Source<String> {
    &mut self.source
  }
}