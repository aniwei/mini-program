mod proj;
mod doctor;

use color_eyre::eyre::Result;
use clap::{arg, Parser, Subcommand};
use log::info;
use proj::ProjStartArgs;
use wx::proj::Proj;

use doctor::*;

/// 命令枚举
#[derive(Subcommand,Debug)]
enum AxCommands {
  Start(AxStartCommand),
  Doctor(AxDoctorCommand)
}

/// 命令行结构
#[derive(Parser, Debug)]
#[command(author="Aniwei", version, about, long_about = None)]
struct AxCommandArgs {
  #[arg(short, long)]
  verbose: bool,

  #[command(subcommand)]
  command: Option<AxCommands>,
}



/// start 命令
#[derive(Parser, Debug)]
struct AxStartCommand {
  #[arg(short, long)]
  port: Option<u32>,

  #[arg(short, long)]
  host: Option<String>,

  #[arg(short, long)]
  root: Option<String>,

  #[arg(short, long)]
  watch: Option<bool>,
}

/// doctor 命令
#[derive(Parser, Debug)]
struct AxDoctorCommand {}

fn main() -> Result<()>{
  color_eyre::install()?;

  let args = AxCommandArgs::parse();

  if args.verbose {
    pretty_env_logger::formatted_builder().filter_level(log::LevelFilter::Trace).init();
  }

  // 读取参数
  if let Some(command) = args.command {
    match command {
      AxCommands::Start(AxStartCommand { port, host, root, watch }) => {
        let proj_args = ProjStartArgs::from(AxStartCommand {
          port,
          host,
          root,
          watch
        });

        let mut proj = Proj::new(
          proj_args.root, 
          proj_args.port, 
          proj_args.host,
          proj_args.watch
        );

        if let Ok(is_wxproj) = proj.is_wxproj() {
          info!("Starting a WeChat MiniProgram project.")

          // GOON
        } else {
          info!("The current path is not a WeChat MiniProgram project.")
        }
      },
      AxCommands::Doctor(AxDoctorCommand{}) => {
        print!("Doctor")
      }
    }
  }

  Ok(())
}