use std::{cell::RefCell, path::{Path, PathBuf}, rc::Rc, vec};


use tokio::fs::read;
use asset::asset::{Asset, FileAsset, XML};
use mustache::*;
use anyhow::*;
use async_trait::async_trait;

use crate::element::Element;

#[async_trait]
impl FileAsset for XML {
  async fn load(&mut self) -> anyhow::Result<()> {
    let path = self.get_source().absolute_path.as_path();
    let raw = read(path).await.map_err(|e| anyhow!(e))?;
    
    self.set_raw(raw);

    Ok(())
  }
}


#[async_trait]
pub trait TemplateRender {
  type T;

  async fn render(&self, data: Option<Self::T>) -> anyhow::Result<String>;
}

#[async_trait]
pub trait TemplateParse {
  async fn parse(&mut self) -> anyhow::Result<()>;
}

pub struct XMLTemplate {
  pub asest: Rc<RefCell<XML>>,
  pub ast: Option<Element>,
  pub template: String,
}

impl XMLTemplate {
  pub fn new(asest: Rc<RefCell<XML>>) -> Self {
    Self {
      asest,
      ast: None,
      template: mustache::compile_str(r#"
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
      "#)
    }
  }
}

#[async_trait]
impl TemplateParse for XMLTemplate {
  async fn parse(&mut self) -> anyhow::Result<()> {
    self.asest.borrow_mut().load().await?;

    let raw = self.asest.borrow().get_raw().ok_or_else(|| anyhow!("The xml asset raw cannot be null."))?;
    self.ast = Some(Element::build(raw));

    Ok(())
  }
}

#[async_trait]
impl TemplateRender for XMLTemplate {
  type T = Vec<(String, String)>;

  async fn render(&self, data: Option<Self::T>) -> anyhow::Result<String> {
    let ast = self.ast.as_ref().ok_or_else(|| anyhow!("The xml ast cannot be null."))?;
    let mut data = data.unwrap_or_default();

    let mut context = mustache::MapBuilder::new();
    for (key, value) in data {
      context = context.insert_str(key, value);
    }

    let mut result = String::new();
    self.template.render_data(&mut result, &context)?;

    Ok(result)
  }
}