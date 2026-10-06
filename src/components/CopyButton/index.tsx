import { CopyButton as SharedCopyButton, type CopyButtonProps } from '@lailai0916/ui';

export default function CopyButton(props: CopyButtonProps) {
  // Copy feedback belongs to the exact value that was copied, including async completions.
  return <SharedCopyButton key={props.value} {...props} />;
}
