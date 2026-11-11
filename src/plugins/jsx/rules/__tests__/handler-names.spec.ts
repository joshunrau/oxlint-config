import { ruleTester } from '../../../../__tests__/rule-tester.js';
import { handlerNames } from '../handler-names.js';

const filename = 'view.tsx';

ruleTester.run('handler-names', handlerNames, {
  invalid: [
    {
      code: 'function View() {\n  const save = () => {};\n  return <button onClick={save} />;\n}',
      errors: [{ data: { handler: 'save', prop: 'onClick' }, line: 3, messageId: 'handler' }],
      filename
    },
    {
      code: 'function View() {\n  function save() {}\n  return <button onClick={save} />;\n}',
      errors: [{ messageId: 'handler' }],
      filename
    },
    {
      code: 'function View() {\n  const save = function () {};\n  return <form onSubmit={save} />;\n}',
      errors: [{ messageId: 'handler' }],
      filename
    },
    {
      code: 'function View() {\n  const save = useCallback(() => {}, []);\n  return <button onClick={save} />;\n}',
      errors: [{ messageId: 'handler' }],
      filename
    },
    {
      code: 'function View() {\n  const save = React.useCallback(() => {}, []);\n  return <button onClick={save} />;\n}',
      errors: [{ messageId: 'handler' }],
      filename
    },
    // A module-scope function is local to the file too
    {
      code: 'function save() {}\nfunction View() {\n  return <button onClick={save} />;\n}',
      errors: [{ messageId: 'handler' }],
      filename
    }
  ],
  valid: [
    {
      code: 'function View() {\n  const handleSave = () => {};\n  return <button onClick={handleSave} />;\n}',
      filename
    },
    {
      code: 'function View() {\n  const [open, setOpen] = useState(false);\n  return <button onClick={setOpen} />;\n}',
      filename
    },
    // A prop or an import is named by whoever wrote it
    { code: 'function View({ save }: { save: () => void }) {\n  return <button onClick={save} />;\n}', filename },
    { code: "import { save } from './actions';\nfunction View() {\n  return <button onClick={save} />;\n}", filename },
    // Only a bare identifier is checked
    { code: 'function View() {\n  return <button onClick={() => save()} />;\n}', filename },
    { code: 'function View() {\n  return <button onClick={actions.save} />;\n}', filename },
    // Only an `on…` prop is an event prop
    { code: 'function View() {\n  const save = () => {};\n  return <Form action={save} />;\n}', filename },
    // A value that is not a function
    { code: 'function View() {\n  const save = makeHandler();\n  return <button onClick={save} />;\n}', filename }
  ]
});
