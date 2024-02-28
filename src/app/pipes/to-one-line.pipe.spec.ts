import { ToOneLinePipe } from './to-one-line.pipe';

describe('ToOneLinePipe', () => {
  it('create an instance', () => {
    const pipe = new ToOneLinePipe();
    expect(pipe).toBeTruthy();
  });
});
