use std::collections::HashMap;
use std::result::Result::Ok;

use xml::reader::{EventReader, XmlEvent};
use anyhow::*;

#[derive(Debug)]
pub enum Node {
  Element(Element),
  Text(String),
}

pub type AttributeMap = HashMap<String, String>;

// 构建 element tree
fn build(reader: &mut EventReader<&[u8]>, parent: &mut Element) -> Result<()> {
  loop {
    match reader.next() {
      Ok(XmlEvent::StartDocument { .. }) | 
      Ok(XmlEvent::Comment(..)) | Ok(XmlEvent::CData(..)) | 
      Ok(XmlEvent::Whitespace(..)) |
      Ok(XmlEvent::ProcessingInstruction { .. }) => continue,

      Ok(XmlEvent::StartElement { name, attributes, .. }) => {
        let mut element = Element::new(
          &name.local_name, 
          parent.depth + 1
        );

        for attr in attributes {
          element.attributes.insert(attr.name.local_name, attr.value);
        }
        
        build(reader, &mut element);
        parent.children.push(Node::Element(element));
      },

      Ok(XmlEvent::EndElement { name }) => {
        if name.local_name == parent.name {
          return Ok(());
        } else {
          return Err(Error::msg(format!("Unexpected closing tag: {:?}", name)));
        }
      },

      Ok(XmlEvent::Characters(text)) => {
        parent.children.push(Node::Text(text.clone()));
      },

      Ok(XmlEvent::EndDocument) => return Ok(()),
      
      Err(e) => return Err(Error::msg("Cannot parse."))
    }
  }
}

/// 元素结构
#[derive(Debug)]
pub struct Element {
  pub name: String,
  pub depth: usize,
  pub value: Option<String>,
  pub attributes: AttributeMap,
  pub children: Vec<Node>,
}

/// 元素实现
impl Element {
  pub fn new(name: &str, depth: usize) -> Self {
    Element {
      name: name.to_string(),
      depth: depth,
      value: None,
      attributes: AttributeMap::new(),
      children: Vec::new(),
    }
  }

  // 构建 element tree
  pub fn build(source: &[u8]) -> Self {
    let mut root = Element::new("#root", 0);
    let mut reader = EventReader::new(source);

    build(&mut reader, &mut root);
    root
  }
}