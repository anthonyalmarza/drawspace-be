### Access patterns
Create User
Get User / Bulk Get User: 1

List Public Drawings: 3
List Users Drawings: 4
Get Drawing: 2
Create Public Drawing
Create Private Drawing
Delete Drawing

### Entities
  Entity       PK                                   SK
1 user         user#<userId>                        user#<userId>
2 drawing      drawing#<drawingId>                  drawing#<drawingId>

### GSI1
  Entity       GSI1PK                               GSI1SK
3 drawing      gsi1pkDrawing#<truncatedTimestamp>   gsi1skDrawing#<public/private>#<publishDate>

### GSI2
  Entity       GSI2PK                               GSI2SK
4 drawing      gsi2pkDrawing#<userId>               gsi2skDrawing#<createDate>