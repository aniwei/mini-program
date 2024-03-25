use color_eyre::eyre::Result;
use clap::{arg, Parser, Subcommand};

use log::debug;
use proj::ProjStartArgs;
use std::{env, path::PathBuf};

mod proj;

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

  // 读取参数
  if let Some(command) = &args.command {
    match &command {
      AxCommands::Start(AxStartCommand { port, root, watch }) => {
        let mut projArgs = ProjStartArgs::default();
        println!("{:?}", projArgs);
      }
    }
  }

  Ok(())
}