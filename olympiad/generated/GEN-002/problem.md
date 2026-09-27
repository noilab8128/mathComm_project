# Generated Problem GEN-002

Let $n \ge 2$ be an integer and let $c_1, c_2, \ldots, c_n$ be given nonnegative integers. Write
$S = c_1 + c_2 + \cdots + c_n$.

Call a pair of indices $(i,j)$ with $i \ne j$ *unbalanced* if $c_i \ge c_j + 2$. As long as an
unbalanced pair exists, one may perform the following move: choose any unbalanced pair $(i,j)$ and
replace $c_i$ by $c_i - 1$ and $c_j$ by $c_j + 1$.

**(a)** Prove that, no matter which unbalanced pair is chosen at each step, this process must stop
after finitely many moves (that is, it eventually reaches a state with no unbalanced pair).

**(b)** Prove that the multiset of values $\{c_1, \ldots, c_n\}$ at the moment the process stops does
not depend on which unbalanced pairs were chosen along the way.

**(c)** Write $S = qn + r$ with $q, r$ integers and $0 \le r < n$. Determine, as explicit expressions
in terms of $q$, $r$, and $n$, how many of the $c_i$ equal $q$ and how many equal $q+1$ once the
process has stopped.
