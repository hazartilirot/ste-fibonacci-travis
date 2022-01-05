export default number => function fibonacci(n, memo = {}) {

  if (n === 0 || n === 1) return n;

  if (!memo[n])
    memo[n] = fibonacci(n - 2, memo) + fibonacci(n - 1, memo);

  return memo[n]
  
}(number)
