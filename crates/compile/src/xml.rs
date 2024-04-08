
use mustache::*;

use crate::template::*;

// 模板类型


// 模板解析器
pub struct XMLParser {
  name: String
}

impl XMLParser {
  pub fn new(name: Option<&str>) -> Self {
    Self {
      name: match name {
        Some(name) => name.to_string(),
        None => "$gwx".to_string()
      }
    }
  }

  pub fn parse(&self, kind: XMLKind, index: u32) -> String {
    match kind {
      XMLKind::XML => {
        let key = format1!("{{name}}_{{index}}", name = self.name, index = index + 1);

        let template = mustache::compile_str(r#"
          if (__WXML_GLOBAL__.ops_cached.{{key}}) {
            return __WXML_GLOBAL__.ops_cached.{{key}}
          }
          
          __WXML_GLOBAL__.ops_cached.{{key}} = [];
        
          (function (z) {
            var a = 11; 
            function Z(ops, debugLine) { 
              z.push(['11182016', ops, debugLine]) 
            }
            Z([a, [3, 'button '], [[2, '?:'], [[7], [3, 'secondary']], [1, 'secondary'], [1, '']], [3, ' '], [[2, '?:'], [[7], [3, 'primary']], [1, 'primary'], [1, '']], [3, ' '], [[2, '?:'], [[7], [3, 'loading']], [1, 'loading'], [1, '']], [3, ' '], [[7], [3, 'size']], [3, ' '], [[2, '?:'], [[7], [3, 'disabled']], [1, 'disabled'], [1, '']], [3, ' '], [[2, '?:'], [[7], [3, 'fill']], [1, 'fill'], [1, '']]], ['../inthemood-mini-app/miniprogram/components/Button/index.wxml', 3, 9])
            Z([3, 'hover'], ['../inthemood-mini-app/miniprogram/components/Button/index.wxml', 5, 15])
            Z([[7], [3, 'style']], ['../inthemood-mini-app/miniprogram/components/Button/index.wxml', 4, 9])
          })(__WXML_GLOBAL__.ops_cached.{{key}}); 
          
          return __WXML_GLOBAL__.ops_cached.{{key}}
        "#).unwrap();

        template.reader()
      },
      XMLKind::XS => {
        println!("Parsing XS: {}", self.name);
      }
    }
  }
}