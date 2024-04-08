use mustache::*;
use anyhow::*;

pub enum Template {
  XML {
    key: String,
    template: mustache::Template
  },
  XS {

  },
  CSS {

  }
}

impl Template {
  pub fn render(&self) -> anyhow::Result<String> {
    Ok(match self {
      Template::XML{ key, template } => {
        let data = MapBuilder::new()
          .insert_str("name", "Venus")
          .build();

        let result = template.render_data_to_string(&data)?;
        result
      },
      Template::XS{..} => {
        "".to_string()
      },
      Template::CSS{ ..} => {
        "".to_string()
      }
    })
  }
}
