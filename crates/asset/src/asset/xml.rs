use crate::Source;
use crate::Asset;

/// XML 资源
pub struct XML {
    source: Source
  }
  
  impl XML {
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
  
  impl Asset for XML {
    // 获取资源对象
    fn get_source(&self) -> &Source {
      &self.source
    }
  
    // 获取资源对象
    fn get_mut_source(&mut self) -> &mut Source {
      &mut self.source
    }
  }