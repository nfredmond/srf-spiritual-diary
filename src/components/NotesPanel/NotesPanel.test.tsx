import {beforeEach,describe,it,expect,vi} from 'vitest';
import {render,screen,fireEvent} from '@testing-library/react';
import {NotesPanel} from './NotesPanel';
beforeEach(()=>localStorage.clear());
describe('reflection recovery',()=>{
  it('recovers a draft after closure without reporting it as a saved note',()=>{
    const close=vi.fn();const props={dateKey:'01-01',initialNote:'old note',onSave:vi.fn(),onClose:close};const first=render(<NotesPanel {...props}/>);
    fireEvent.change(screen.getByRole('textbox'),{target:{value:'new draft'}});expect(screen.getByText('Draft saved on this computer')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Close'}));expect(close).toHaveBeenCalled();first.unmount();render(<NotesPanel {...props}/>);expect(screen.getByRole('textbox')).toHaveValue('new draft');
  });
  it('blocks closure and reports an error when draft persistence fails',()=>{
    const close=vi.fn();render(<NotesPanel dateKey="01-01" initialNote="" onSave={()=>{throw new Error('full');}} onClose={close}/>);
    const write=vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('full');});
    fireEvent.change(screen.getByRole('textbox'),{target:{value:'keep me'}});expect(screen.getByRole('alert')).toHaveTextContent('could not be saved');fireEvent.click(screen.getByRole('button',{name:'Close'}));expect(close).not.toHaveBeenCalled();fireEvent.click(screen.getByRole('button',{name:'Save Note'}));expect(screen.getByRole('alert')).toHaveTextContent('Could not save');expect(screen.getByRole('textbox')).toHaveValue('keep me');write.mockRestore();
  });
});
