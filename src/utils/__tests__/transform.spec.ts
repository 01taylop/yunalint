import { pluralise } from '../transform'

describe('pluralise', () => {

  it('returns the original word if count is 1', () => {
    expect(pluralise('apple', 1)).toBe('apple')
  })

  test.each([0, 2])('returns the pluralised word when count is %i', count => {
    expect(pluralise('apple', count)).toBe('apples')
  })

})
