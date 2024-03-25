use color_eyre::eyre::Result;
use clap::{arg, Parser, Subcommand};

use log::debug;
use start::WxStartArgs;

mod start;

#[derive(Parser, Debug)]
#[command(author="Aniwei", version, about, long_about = None)]
struct AxCommandArgs {
  #[arg(short, long)]
  verbose: bool,

  #[command(subcommand)]
  command: Option<AxCommands>,
}

#[derive(Subcommand,Debug)]
enum AxCommands {
  Start(AxStartCommand)
}

#[derive(Parser, Debug)]
struct AxStartCommand {
  #[arg(short, long)]
  port: Option<u32>,

  #[arg(short, long)]
  root: Option<String>,

  #[arg(short, long)]
  watch: Option<bool>,
}

fn main() -> Result<()>{
  color_eyre::install()?;

  let args = AxCommandArgs::parse();

  if args.verbose {
    pretty_env_logger::formatted_builder().filter_level(log::LevelFilter::Trace).init();
  }
  
  let mut startArgs = WxStartArgs::default();
  startArgs.port = 3000;

  if let Some(command) = &args.command {
    match &command {
      AxCommands::Start(AxStartCommand { port, root, watch }) => {
        // 处理端口
        if let Some(p) = port {
          startArgs.port = p.to_owned();
        }

        // 处理项目路径
        if let Some(root) = root {
          startArgs.root = Box::new(root.to_owned());
        }
      }
    }
  }
  
  println!("{:?}", args);

  Ok(())
}