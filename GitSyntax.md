## 먼저 status check
## 현재 update를 해야 할 파일이랑 add를 해야할 파일들이 보임
-- git status 
    >> On branch develop
    >> Your branch is up to date with 'origin/develop'.
    >> Untracked files:
    >> (use "git add <file>..." to include in what will be committed)
    >>    GitSyntax.md

## git은 local에 save를 한다음에 github server에 push를 한다.
## 즉, add/delete은 서버에 있는 파일들을 업데이트 하는것이 아니라 로컬에 있는 것들을 업데이트 하는것이다.
## 그래서 add/delete을 한다음에 commit을 하면 로컬에 있는 파일들이 서버에 가기전 ready가 됬다는 것을 알려주는 것임.


### 하나의 파일만 add 하고 싶을때 
-- git add GitSyntax.md    # Stage file
### 모든 파일을 다 add 하고 싶을때 
-- git add .               # Stage everything 
### Commit
-- git commit -m "message" # Commit
### Push
-- git push                # Upload to GitHub

### Commit and Push
-- git commit -am "message" # Commit and push

## Download 
git clone <url>     # Clone repo
git fetch           # Get remote updates (safe)
git status          # Check status
git pull            # Fetch + merge

## Fetch and pull
git fetch ==> Downloads updates from remote, does NOT change your code
git pull ==> Downloads updates AND merges them into your current branch
git pull = git fetch + git merge

## When you pull
git diff main origin/main


## 브랜치 관리
git branch             # List branches
git branch new-branch  # Create branch
git checkout branch    # Switch branch
git checkout -b branch # Create + switch

## Merge and Sync
git merge branch       # Merge branch into current
git pull origin main   # Update main branch

