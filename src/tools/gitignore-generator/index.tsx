import { createUtilityTool } from '@/components/UtilityWorkbench';
import { developmentGuides } from '@/content/toolGuides/development';
import { utilityDefinitions } from '@/utils/utilityDefinitions';

export default createUtilityTool(
  utilityDefinitions.gitignoreGenerator,
  developmentGuides.gitignoreGenerator
);
